# Family Calendar - Claude Code ガイド

## ブランチ命名規則

| 種別 | フォーマット | 例 |
|---|---|---|
| 新機能 | `feat/<機能名>` | `feat/auth`, `feat/voice-input` |
| バグ修正 | `fix/<修正内容>` | `fix/login-error`, `fix/calendar-display` |

- ベースブランチは常に `develop`
- `main` へのマージは `develop` 経由でPRを通す

## コード説明

実装後は必ずコードの説明を出力する。

## 技術スタック

- **フレームワーク**: Next.js (App Router) + TypeScript
- **スタイリング**: Tailwind CSS
- **DB**: Firebase Firestore
- **認証**: Firebase Authentication
- **通知（予定）**: Firebase Cloud Messaging
- **音声入力**: Web Speech API
- **デプロイ**: Vercel
