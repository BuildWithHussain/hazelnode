let webserver_port = 8000; // Default port

try {
  const common_site_config = require('../../../sites/common_site_config.json');
  webserver_port = common_site_config.webserver_port || 8000;
} catch {
  // Config file not available (building outside Frappe bench)
  console.log('Using default webserver port:', webserver_port);
}

export default {
  '^/(login|app|api|assets|files|private)': {
    target: `http://127.0.0.1:${webserver_port}`,
    ws: true,
    router: function (req: { headers: { host: string } }) {
      const site_name = req.headers.host.split(':')[0];
      return `http://${site_name}:${webserver_port}`;
    },
  },
};
