export default () => {
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL must be set');
  if (!process.env.MONGO_OPLOG_URL) throw new Error('MONGO_OPLOG_URL must be set');
  if (!process.env.ROOT_URL) throw new Error('ROOT_URL must be set');
  if (process.env.TZ !== 'Etc/UTC') throw new Error('TZ must be Etc/UTC');
};
