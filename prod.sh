NODE_ENV=production
while `true`
do
  node launcher.js
  echo "Server has crashed. Relaunching..."
  sleep 10
done


