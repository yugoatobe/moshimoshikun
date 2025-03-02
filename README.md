```
python -m venv moshimoshi
```
```
source moshimoshi/bin/activate
```



起動:
1. レポジトリをローカルにクローンします。
2. ターミナルで `npm install` を実行して、依存関係をインストールします。
3. IDE または `.env` ファイルで以下の環境変数を設定します:
   - `ASTRA_DB_NAMESPACE`: ベクター対応DBの既存のAstra Namespace/Keyspace
   - `OPENAI_API_KEY`: OpenAIのAPIキー
   - `ASTRA_DB_ENDPOINT`: Astra DBベクターデータベースのエンドポイント
   - `ASTRA_DB_APPLICATION_TOKEN`: Astraデータベースの生成されたアプリケーショントークン
     - 新しいトークンを作成するには、データベースの `Connect` タブに移動し、`Generate Token` をクリックします。
4. ターミナルで `npm run seed` を実行して、サンプルデータをデータベースに投入します。

開発サーバーを起動するには、ターミナルで `npm run dev` を実行します。ブラウザで [http://localhost:3000](http://localhost:3000) を開いて表示します。
