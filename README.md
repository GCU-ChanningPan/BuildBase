# BuildBase — 電子黒板 / 工事写真管理 プロトタイプ

電子黒板（工事写真管理）のプロトタイプです。

## 構成

- `*.jsx` — 画面コンポーネント（iPad / iPhone / Web）
- `*.js` — データ・ストア
- `styles.css` — スタイル
- `電子黒板 工事写真管理 プロトタイプ.html` — エントリ HTML
- `assets/`, `uploads/` — 画像リソース

## 開発フロー（チーム）

このリポジトリは複数人で共同編集します。

1. 自分用のブランチを切る
   ```sh
   git switch -c feature/<your-name>-<内容>
   ```
2. コードを編集してコミット（コミットすると自動で GitHub に push されます）
   ```sh
   git add -A
   git commit -m "変更内容の説明"
   ```
3. GitHub 上で Pull Request を作成 → レビュー → `main` にマージ

> コミット後の自動 push は `.git/hooks/post-commit` で設定されています。
