# 消費期限シール作成

シフォンケーキ用の消費期限シールを、商品テンプレートと日付入力からA4横PDFにするローカルアプリです。

## 現在できること

- 商品テンプレート12件から選択
- 消費期限をカレンダーで選択
- 20面付けのA4横PDFを作成
- PDFを保存
- PDFプレビューから印刷
- 管理者設定でラベル用紙の寸法を変更
- 管理者設定で商品テンプレートを編集・追加

## 起動

```bash
npm install
npm run dev
```

表示されたローカルURLを開きます。処理は端末内で完結します。

## 通常操作

1. 商品を選ぶ
2. 消費期限を選ぶ
3. PDFを作成して印刷する

## 管理者設定

ラベル用紙の袋や説明書に書かれている数値を、そのまま入力する形にしています。

- 左余白
- 上余白
- ラベル幅
- ラベル高さ
- 横間隔
- 縦間隔
- 列数
- 行数

初期値は、添付PDFを解析した現行シフォン裏シールの値です。

## Electron化

Electronは、このWebアプリをWindows/Macの通常アプリとして開けるようにするための仕組みです。

このリポジトリには `electron/main.cjs` を用意しています。配布版を作る段階で `electron` とパッケージング設定を追加すると、`.app` や `.exe` にできます。

## 印刷確認

本番利用前に、実際のラベル用紙とプリンタで以下を確認してください。

- A4横
- 倍率100%
- 用紙に合わせる設定を使わない
- 左右上下のズレがないか

ズレがある場合は、管理者設定の左余白・上余白・横間隔・縦間隔を調整します。

## GitHub Pagesでの試験公開

試験運用では、個人GitHubアカウント `rns111603h` のリポジトリ `chiffon-label-maker` に公開します。

試験公開URL:

https://rns111603h.github.io/chiffon-label-maker/

正式運用に移るときは、法人用のGitHub Organizationまたはアカウントへ移行します。

注意: 公開するのは `Projects/expiry-label-maker` だけです。親フォルダ全体をGitHubへ公開しないでください。

以下のコマンドは、アプリの中ではなく、親Gitリポジトリのルート `/Users/kouyayonaha/Apps_Service develop` で実行します。

公開用ブランチを作り直し、試験用リポジトリへ送るコマンド:

```bash
cd "/Users/kouyayonaha/Apps_Service develop"
git branch -D publish/chiffon-label-maker 2>/dev/null || true
git subtree split --prefix Projects/expiry-label-maker -b publish/chiffon-label-maker
git push git@github.com:rns111603h/chiffon-label-maker.git publish/chiffon-label-maker:main
```

直接URLへpushすることで、親フォルダ側にGitHub remoteを残さず、誤って全体をpushする事故を避けます。

商品ラベルPDFは `public/product-labels/` に置き、`src/productLabelPdfs.ts` で対応づけます。

GitHub Pagesは静的サイトです。画面からPDFをサーバーへアップロードする運用はできません。
