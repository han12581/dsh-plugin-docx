dsh-plugin-docx — 本地 DSH 插件（JavaScript）
========================================

功能
- read(filePath): 从 .docx 提取纯文本（返回字符串）。
- write(text, outPath): 从纯文本生成 .docx。
- extractTables(filePath): 提取文档中的表格，返回 JSON（数组的数组）。

安装（Windows，示例路径 C:\dsh-plugins\dsh-plugin-docx）
1. 创建目录并把文件保存（本脚本已完成此步骤）。
2. 进入目录：
   cd C:\dsh-plugins\dsh-plugin-docx
3. 安装依赖：
   npm install

把插件添加到 dsh（profile = web）
1. 添加本地插件：
   npx @deepseek-ai/dsh plugin --profile web add "link:C:\dsh-plugins\dsh-plugin-docx"
2. 重启或 reload dsh web（按你的部署方式执行）。

在 dsh 对话中直接使用（示例）
- 读取文档：
  /docx.read C:\path\to\file.docx
- 提取表格（JSON）：
  /docx.extractTables C:\path\to\file.docx
- 生成 docx：
  /docx.write C:\path\to\out.docx --text "要写入的文本"

本地测试（不经 dsh）
- 读取：
  node -e "require('./src/docx-service').readDocx('C:\\path\\to\\example.docx').then(t=>console.log(t)).catch(e=>console.error(e))"
- 表格：
  node -e "require('./src/docx-service').extractTables('C:\\path\\to\\example.docx').then(t=>console.log(JSON.stringify(t,null,2))).catch(e=>console.error(e))"
- 写入：
  node -e "require('./src/docx-service').writeDocx('Hello from DSH plugin','C:\\path\\to\\out.docx').then(()=>console.log('done')).catch(e=>console.error(e))"

注意事项
- dsh web profile 可能在服务器端运行；确保文件路径是运行 dsh 进程能够访问到的（对于 web profile，通常要先上传文件至服务器或使用 dsh 的上传中转）。如果 dsh 在本机运行并有文件访问权限，直接使用本地路径即可。
- 当前实现提取表格为纯文本数组，不保留单元格样式或图片。若需提取图片、复杂表格格式或模板合并，我可以继续扩展服务.
