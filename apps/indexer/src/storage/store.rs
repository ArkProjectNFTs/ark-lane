///! Structs and traits related to data to be stored
///! after indexing Starklane bridge events.

use anyhow::Result;
use async_trait::async_trait;

use crate::storage::{Request, Event, BlockIndex};

/// Store related to the indexing state.
#[async_trait]
pub trait IndexingStore {
    ///
    async fn insert_block(&self, block: BlockIndex) -> Result<()>;

    ///
    async fn block_by_number(&self, block_number: u64) -> Result<Option<BlockIndex>>;
}

/// Store for the requests content.
#[async_trait]
pub trait RequestStore {
    ///
    async fn reqs_by_wallet(&self, address: &str) -> Result<Vec<Request>>;

    ///
    async fn req_by_hash(&self, hash: &str) -> Result<Option<Request>>;

    ///
    async fn insert_req(&self, req: Request) -> Result<()>;
}

/// Store for events.
#[async_trait]
pub trait EventStore {
    ///
    async fn insert_event(&self, event: Event) -> Result<()>;

    ///
    async fn events_by_request(&self, req_hash: &str) -> Result<Vec<Event>>;
}

/// Store for bridged collections.
#[async_trait]
pub trait CollectionStore {
    /// Insert a collection as being bridged for the first time.
    async fn insert_collection(
        &self,
        chain_src: &str,
        address_src: &str,
        address_dst: &str,
        time: u64,
        req_hash: &str,
    ) -> Result<()>;
}
