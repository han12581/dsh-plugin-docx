// dsh-plugin-docx - plugin entry (CommonJS)
// Compatible with typical Cordis/dsh plugin patterns (robust checks for service/command APIs)

module.exports = function (ctx) {
  ctx.plugin({
    name: 'dsh-plugin-docx',
    apply() {
      const docxService = require('./docx-service');

      // Register service in whichever API the host exposes
      try {
        // preferred: Cordis-style ctx.service
        if (typeof ctx.service === 'function') {
          ctx.service('docx', {
            read: async (filePath) => ({ text: await docxService.readDocx(filePath) }),
            write: async (text, outPath) => { await docxService.writeDocx(text, outPath); return { out: outPath }; },
            extractTables: async (filePath) => ({ tables: await docxService.extractTables(filePath) })
          });
        } else if (ctx.services) {
          // fallback
          ctx.services.docx = {
            read: docxService.readDocx,
            write: docxService.writeDocx,
            extractTables: docxService.extractTables
          };
        } else {
          // final fallback attach to ctx
          ctx.docx = {
            read: docxService.readDocx,
            write: docxService.writeDocx,
            extractTables: docxService.extractTables
          };
        }
      } catch (e) {
        // attach fallback as above
        ctx.services = ctx.services || {};
        ctx.services.docx = {
          read: docxService.readDocx,
          write: docxService.writeDocx,
          extractTables: docxService.extractTables
        };
      }

      // Register chat/command bindings if available (so users can call from chat)
      if (typeof ctx.command === 'function') {
        // docx.read <path>
        ctx.command('docx.read', 'Read a .docx file').action(async ({ session, args }) => {
          const file = (args && args[0]) || null;
          if (!file) return session.send('用法: docx.read <本地路径>');
          try {
            const text = await docxService.readDocx(file);
            const preview = text.length > 20000 ? text.slice(0, 20000) + '\n\n... (truncated)' : text;
            session.send(preview);
          } catch (err) {
            session.send('读取失败：' + String(err));
          }
        });

        // docx.write <out> --text "..."
        ctx.command('docx.write', 'Write a .docx file from given text').option('text').action(async ({ session, args, opts }) => {
          const out = (args && args[0]) || opts.out || null;
          const text = opts.text || opts.t || null;
          if (!out) return session.send('用法: docx.write <输出路径> --text "<要写入的文本>"');
          if (!text) return session.send('请使用 --text 提供要写入的文本，例如: docx.write C:\\out.docx --text "内容"');
          try {
            await docxService.writeDocx(text, out);
            session.send('已生成：' + out);
          } catch (err) {
            session.send('写入失败：' + String(err));
          }
        });

        // docx.extractTables <path>
        ctx.command('docx.extractTables', 'Extract tables from a .docx and return JSON').action(async ({ session, args }) => {
          const file = (args && args[0]) || null;
          if (!file) return session.send('用法: docx.extractTables <本地路径>');
          try {
            const tables = await docxService.extractTables(file);
            // If too large, truncate in output
            const out = JSON.stringify(tables, null, 2);
            session.send(out.length > 20000 ? out.slice(0, 20000) + '\n\n... (truncated)' : out);
          } catch (err) {
            session.send('表格提取失败：' + String(err));
          }
        });
      }
    }
  });
};
