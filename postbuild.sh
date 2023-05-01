echo "Clearing past builds..."
rimraf build

PKG_VERSION=`node -p "require('./package.json').version"`

echo "Building app"
BUNDLE_NAME="hisptz-chatbot-$PKG_VERSION.zip"
bestzip "$BUNDLE_NAME" app package.json .env.example yarn.lock Dockerfile docker-compose.yml prisma
mkdir "build"
mv $BUNDLE_NAME build
