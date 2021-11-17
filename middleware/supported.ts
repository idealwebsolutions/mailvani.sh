interface SupportOptions {
  supportedMethods: Array<String>
};

export default function checkSupported (options: SupportOptions) {
  return (req, res, next) => {
    if (options.supportedMethods.indexOf(req.method) > -1) {
      next();
      return;
    }
    res.setHeader('Allow', options.supportedMethods);
    res.status(405).end(`Method ${req.method} is not allowed`);
  };
}