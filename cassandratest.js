const cassandra = require('cassandra-driver');

const cassandraclient = new cassandra.Client({
  contactPoints: [ '172.17.0.3' ],
  localDataCenter: 'datacenter1',
  authProvider: new cassandra.auth
   .PlainTextAuthProvider('developer', 'taehyungSweetNightGucciYeontan')
});
cassandraclient.execute(`CREATE KEYSPACE IF NOT EXISTS vq_ai_tracking WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };`)
.then(() =>
cassandraclient.execute(`CREATE TABLE IF NOT EXISTS vq_ai_tracking.actions(userId uuid primary key);`,
(err, result) => {
    console.log(err, result);
}));