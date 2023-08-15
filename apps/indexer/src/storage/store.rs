///! Structs and traits related to data to be stored
///! after indexing Starklane bridge events.

use anyhow::Result;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

use crate::utils::BridgeChain;

///
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct BlockIndex {
    pub chain: BridgeChain,
    pub block_number: u64,
    pub block_hash: String,
    pub block_timestamp: u64,
    pub insert_timestamp: u64,
}

/// TODO: Need better data structure for this one...
///       we may also want the details of tokens, extracted
///       from the request content.
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct CollectionContract {
    pub chain_src: BridgeChain,
    pub address_src: String,
    pub address_dst: String,
}

/// Request sent on the bridge.
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Request {
    // Request's hash, unique identifier through source and destination chains.
    pub hash: String,
    // Source chain.
    pub chain_src: BridgeChain,
    // Wallet originating the request on the source chain.
    pub from: String,
    // Wallet receiving the assets on the destination chain.
    pub to: String,
    // Address of the collection associated to this request.
    pub collection: String,
    // Raw content of the request (JSON) in it's serialized form.
    pub content: String,
}

/// Records event associated to requests.
#[derive(Debug, Serialize, Deserialize)]
pub struct Event {
    // The event label.
    pub label: EventLabel,
    // Block timestamp containing the event associated with the status change.
    pub block_timestamp: u64,
    // The block number associated with the event emission.
    pub block_number: u64,
    // Transaction hash of the transaction which triggered the event.
    pub tx_hash: String,
}

///
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EventLabel {
    DepositInitiatedL1,
    WithdrawCompletedL1,
    TransitErrorL1L2,

    DepositInitiatedL2,
    WithdrawCompletedL2,
    TransitErrorL2L1,
}

///
impl ToString for EventLabel {
    fn to_string(&self) -> String {
        match self {
            EventLabel::DepositInitiatedL1 => String::from("deposit_initiated_l1"),
            EventLabel::WithdrawCompletedL1 => String::from("withdraw_completed_l1"),
            EventLabel::TransitErrorL1L2 => String::from("transit_error_l1_l2"),

            EventLabel::DepositInitiatedL2 => String::from("deposit_initiated_l2"),
            EventLabel::WithdrawCompletedL2 => String::from("withdraw_completed_l2"),
            EventLabel::TransitErrorL2L1 => String::from("transit_error_l2_l1"),
        }
    }
}

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
