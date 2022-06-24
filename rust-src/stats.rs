
// url of cassandra server

# extern crate scylla;
# extern crate tokio;
# use std::error::Error;
# async fn check_only_compiles() -> Result<(), Box<dyn Error>> {
use scylla::{Session, SessionBuilder};


let mut file = File::open("../config.json").unwrap();
let mut data = String::new();
file.read_to_string(&mut data).unwrap();

let json = Json::from_str(&data).unwrap();

let username = String::json.find_path(&["cassandra", "plainTextUsername"]);

let password = String::json.find_path(&["cassandra", "plainTextPassword"]);


let session: Session = SessionBuilder::new()
    .known_node("127.0.0.1:9042")
    .user(username, password)
    .build()
    .await?;

    if let Some(rows) = session.query("SELECT videoid, added FROM adorastats.trackedytvideosids", &[]).await?.rows {
        for row in rows.into_typed::<(String,uuid::Uuid)>() {
            let (videoid, added) = row?;
            println!("videoid, added: {}, {}, {}", videoid, added);
        }
    }

# Ok(())
# }

