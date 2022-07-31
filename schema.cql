CREATE KEYSPACE adoramoderation WITH replication = {'class': 'NetworkTopologyStrategy', 'datacenter1': '1'}  AND durable_writes = true;

CREATE TABLE adoramoderation.badlinks (
    link text PRIMARY KEY,
    addedbyid text,
    addtime timeuuid,
    type text
) WITH  bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE TABLE adoramoderation.banneduserlist (
    banneduserid text PRIMARY KEY,
    banned boolean,
    firstchangedbyid text,
    firstchangedtime timeuuid,
    lastchangedbyid text,
    lastchangedtime timeuuid,
    reason text,
    unknownuser boolean
) WITH  bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE INDEX banneduserlist_banned_idx ON adoramoderation.banneduserlist (banned);

CREATE TABLE adoramoderation.completedbans (
    guildid text,
    userid text,
    timeofban bigint,
    PRIMARY KEY (guildid, userid)
) WITH CLUSTERING ORDER BY (userid ASC)
    
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE TABLE adoramoderation.guildssubscribedtoautoban (
    serverid text PRIMARY KEY,
    firstchangedbyid text,
    firstchangedtime timeuuid,
    lastchangedbyid text,
    lastchangedtime timeuuid,
    subscribed boolean
) WITH  bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE TABLE adoramoderation.nonmemberbanlimit (
    guildid text PRIMARY KEY,
    time bigint
) WITH  bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE KEYSPACE adorasafebrowsing WITH replication = {'class': 'NetworkTopologyStrategy', 'datacenter1': '1'}  AND durable_writes = true;

CREATE TABLE adorasafebrowsing.liststate (
    list text PRIMARY KEY,
    state text
) WITH  bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE TABLE adorasafebrowsing.threatprefixes (
    prefix text PRIMARY KEY,
    platform text,
    threat text,
    time timeuuid
) WITH  bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE KEYSPACE adorastats WITH replication = {'class': 'NetworkTopologyStrategy', 'datacenter1': '1'}  AND durable_writes = true;

CREATE TABLE adorastats.statpoints (
    source text PRIMARY KEY,
    amount counter
) WITH  bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE TABLE adorastats.trackedytvideosids (
    videoid text PRIMARY KEY,
    added timeuuid,
    videoname text
) WITH  bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE TABLE adorastats.ytvideostats (
    videoid text,
    time timeuuid,
    comments bigint,
    dislikes bigint,
    likes bigint,
    views bigint,
    PRIMARY KEY (videoid, time)
) WITH CLUSTERING ORDER BY (time ASC)
    
    AND bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE KEYSPACE adoravotes WITH replication = {'class': 'NetworkTopologyStrategy', 'datacenter1': '1'}  AND durable_writes = true;

CREATE TABLE adoravotes.pendingvotereminders (
    time timeuuid PRIMARY KEY,
    sent boolean,
    service text,
    userid text
) WITH  bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE TABLE adoravotes.votes (
    time timeuuid PRIMARY KEY,
    userid text,
    voteservice text
) WITH  bloom_filter_fp_chance = 0.01
    AND caching = {'keys': 'ALL', 'rows_per_partition': 'NONE'}
    
    AND comment = ''
    AND compaction = {'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32', 'min_threshold': '4'}
    AND 
    AND crc_check_chance = 1.0
    AND default_time_to_live = 0
    
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    
    AND speculative_retry = '99p';

CREATE KEYSPACE cycling WITH replication = {'class': 'NetworkTopologyStrategy', 'datacenter1': '1'}  AND durable_writes = true;