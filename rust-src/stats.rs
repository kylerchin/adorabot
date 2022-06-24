

// url of cassandra server

extern crate scylla;
extern crate tokio;
extern crate serde_json;
extern crate serde;
use std::error::Error;
use scylla::{Session, SessionBuilder};
use std::io::Read;
use std::fs::File;
use serde_json::{Result, Value};
extern crate uuid;

use crate::scylla::IntoTypedRows;


use uuid::Uuid;

use serde::{Deserialize, Serialize};
// mandatory lines to use json in rust


fn main() {



let file = std::fs::File::open("./config.json")
    .expect("file should open read only");
let json: serde_json::Value = serde_json::from_reader(file)
    .expect("file should be proper JSON");
let username = json.get("config").and_then(|value| value.get("cassandra"))
.and_then(|value| value.get("plainTextUsername"))
    .expect("file should have config.cassandra.plainTextUsername key");

    print!("user {}", username);

    let password = json.get("config").and_then(|value| value.get("cassandra"))
.and_then(|value| value.get("plainTextPassword"))
    .expect("file should have config.cassandra.plainTextPassword key");

    print!("pw {}", password);

    async fn getallurls() -> Result<()> {

 
        let session: Session = SessionBuilder::new()
            .known_node("127.0.0.1:9042")
            .user(username, password)
            .build()
            .await?;
        
            if let Some(rows) = session.query("SELECT videoid, added FROM adorastats.trackedytvideosids", &[]).await?.rows {
                for row in rows.into_typed::<(String,uuid::Uuid)>() {
                    let (videoid, added) = row?;
                    println!("videoid, added: {}, {}", videoid, added);
                }
            }
        
        Ok(())
        }
    
    
        getallurls();
    

}

