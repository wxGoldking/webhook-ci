var http = require('http')
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/', secret: '1qazxsw2' }) 
// 上面的 path 即是github中填写的url的path部分
// 上面的 secret 保持和 GitHub 后台设置的一致
 
function run_cmd(cmd, args, callback) {
  var spawn = require('child_process').spawn;
  var child = spawn(cmd, args);
  var resp = "";
 
  child.stdout.on('data', function(buffer) { resp += buffer.toString(); });
  child.stdout.on('end', function() { callback (resp) });
}
 
http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777)
// listen(7777)指监听7777端口,可以根据实际情况改成你自己的
 
handler.on('error', function (err) {
  console.error('Error:', err.message)
})

// push事件触发
handler.on('push', function (event) {
  var name=event.payload.repository.name;
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);
  // 判断master分支变动时执行，可根据payload.ref区分分支
  if (event.payload.ref === 'refs/heads/master') {
    run_cmd('sh', ['./deploy.sh',name], function(text){ console.log(text) });
  }
})

//这里为了实现不同仓库的自动部署,传了仓库名给shell脚本 
handler.on('issues', function (event) {
  console.log('Received an issue event for % action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title)
})