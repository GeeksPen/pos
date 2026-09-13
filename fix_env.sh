sed -i 's/APP_NAME=Laravel/APP_NAME=SevenText/' .env.example
sed -i 's/APP_URL=http:\/\/localhost/APP_URL=https:\/\/seventext.co.uk/' .env.example
sed -i 's/APP_NAME=POS_System/APP_NAME=SevenText/' .env.production
sed -i 's/APP_URL=http:\/\/your-production-domain.com/APP_URL=https:\/\/seventext.co.uk/' .env.production
sed -i 's/"name": "frontend"/"name": "seventext-web"/' frontend/package.json
sed -i 's/"name": "mobile"/"name": "SevenText"/' mobile/app.json
sed -i 's/"slug": "mobile"/"slug": "seventext"/' mobile/app.json
sed -i 's/"name": "desktop"/"name": "seventext-desktop"/' desktop/package.json
sed -i 's/"appId": "com.pos.desktop"/"appId": "uk.co.seventext.desktop",\n    "productName": "SevenText"/' desktop/package.json
