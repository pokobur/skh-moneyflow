#!/bin/bash
set -e

echo "🔨 静的エクスポートビルドを開始します..."
npm run build

echo "🚀 GitHub Pages (gh-pages ブランチ) へデプロイしています..."
cd out
touch .nojekyll
rm -rf .git
git init -b gh-pages
git config user.name "plyo"
git config user.email "py.@plyonoMacBook-Air.local"
git add -A
git commit -m "Deploy custom domain to GitHub Pages $(date +'%Y-%m-%d %H:%M:%S')"
git remote add origin https://github.com/pokobur/sky-moneyflow.git
git push -f origin gh-pages
rm -rf .git
cd ..

echo "🎉 デプロイ完了！"
echo "カスタムドメイン https://skh-moneyflow.plyo.blog にて数分で反映されます。"
