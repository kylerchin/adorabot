
// url of cassandra server
let uri = "127.0.0.1:9042";

let session: Session = SessionBuilder::new().known_node(uri).build().await?;

if let Some(rows) = session.query("SELECT videoid, added FROM adorastats.trackedytvideosids", &[]).await?.rows {
    for row in rows.into_typed::<(String,uuid::Uuid)>() {
        let (videoid, added) = row?;
        println!("videoid, added: {}, {}, {}", videoid, added);
    }
}