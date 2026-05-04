# EigoGakushu

不規則動詞クイズの静的Webアプリです。`index.html` をブラウザで開けば動作します。

## GitHub Pages で公開する手順

1. このリポジトリのデフォルトブランチを **main** にする。
2. GitHub の **Settings > Pages > Build and deployment** を開く。
3. Source は **GitHub Actions** を選ぶ。
4. `main` ブランチに push すると、`.github/workflows/deploy-pages.yml` が実行されて公開される。
5. 公開URLは Actions の `Deploy to GitHub Pages` ジョブ完了後に表示される。

## ローカル実行

```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```
