import OpenAI from 'openai';
import {OpenAIStream, StreamingTextResponse} from 'ai';
import {AstraDB} from "@datastax/astra-db-ts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const astraDb = new AstraDB(process.env.ASTRA_DB_APPLICATION_TOKEN, process.env.ASTRA_DB_ENDPOINT, process.env.ASTRA_DB_NAMESPACE);

export async function POST(req: Request) {
  try {
    const {messages, useRag, llm, similarityMetric} = await req.json();

    const latestMessage = messages[messages?.length - 1]?.content;

    let docContext = '';
    if (useRag) {
      const {data} = await openai.embeddings.create({input: latestMessage, model: 'text-embedding-ada-002'});

      const collection = await astraDb.collection(`chat_${similarityMetric}`);

      const cursor= collection.find(null, {
        sort: {
          $vector: data[0]?.embedding,
        },
        limit: 5,
      });
      
      const documents = await cursor.toArray();
      
      docContext = `
        START CONTEXT
        ${documents?.map(doc => doc.content).join("\n")}
        END CONTEXT
      `
    }
    const ragPrompt = [
      {
      //   role: 'system',
      //   content: `You are an AI assistant answering questions about Cassandra and Astra DB. Format responses using markdown where applicable.
      //   ${docContext} 
      //   If the answer is not provided in the context, the AI assistant will say, "I'm sorry, I don't know the answer".
      // `,
        role: 'system',
        content: `あなたは、サポートセンターにおいて通話記録を要約するAIです。ユーザーとカスタマーサポートオペレーターのお問い合わせ電話を書き起こしテキストが入力されるので、会話内容を要約してください。複数の話題・結論が含まれている場合があります。特にユーザ側の問題・解決したいこと（ex. 入稿方法が分からない）（ex. 前回の印刷の解像度が悪い）、質問（ex. 最短の出荷日はいつか）、要望（ex. 1月1日までに到着して欲しい）（ex. A4サイズの右開き100ページのデータを100部入稿したい）やオペレーター側の提案（ex. データチェックお急ぎ便について案内した）、決定した内容（ex. 1時までに再度連絡をする）については漏れなく含めてください。また、個人情報の出力は禁止されています。
        入力に関する注意事項
        テキストは、speaker_1, speaker_2の2種類でラベル付けされており、speaker_1はカスタマーサポートオペレーター側の発言、speaker_2はユーザー側の発言のことが多いが、反転している可能性があるので会話内容から判断する
        ${docContext} 
        // If the answer is not provided in the context, the AI assistant will say, "I'm sorry, I don't know the answer".
      `,
      },
    ]


    const response = await openai.chat.completions.create(
      {
        // model: llm ?? 'gpt-3.5-turbo',
        model: llm ?? 'gpt-4-0125-preview',
        stream: true,
        messages: [...ragPrompt, ...messages],
      }
    );
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (e) {
    throw e;
  }
}
