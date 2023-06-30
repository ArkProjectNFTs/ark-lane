// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./CairoAdapter.sol";
import "./Protocol.sol";
import "./ERC721Bridgeable.sol";

import "starknet/IStarknetMessaging.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";

// TODO: add custom errors for better debug and UX.
// TODO: test consuming message with the serialized request....!
//       the front must send the request in it's uint256[] buffer form....!
//       Then at this moment check if collection deployed or not + then permissioned_mint / transfer.

/*
 * Bridge contract.
 */
contract Bridge is Ownable {

    // StarknetCore address.
    address _starknetCore;
    // Bridge L2 address for messaging.
    uint256 _bridgeL2;
    // Mapping between L2<->L1 collections addresses.
    // <collection_l2_address, collection_l1_address>
    mapping(uint256 => address) _l2_to_l1_addresses;
    // Mapping between L1<->L2 collections addresses.
    // <collection_l1_address, collection_l2_address>
    mapping(address => uint256) _l1_to_l2_addresses;
    // Escrowed token.
    // Mapping of the collection address, to the mapping (token_id, depositor address).
    mapping(address => mapping(uint256 => address)) _escrow;

    /*
     *
     */
    constructor(address starknetCore, uint256 bridgeL2)
    {
        require(starknetCore != address(0), "StarknetCore address");
        require(CairoAdapter.isContractAddress(bridgeL2), "Invalid Bridge L2 address");

        _starknetCore = starknetCore;
        _bridgeL2 = bridgeL2;
        _transferOwnership(msg.sender);
    }

    /*
     * Event emitted when a collection is deployed for the
     * first token being bridged from L2.
     */
    event CollectionDeployedFromL2(
        address indexed l1Address,
        uint256 indexed l2Address,
        string name,
        string symbol
        );

    /*
     * TODO: check what's better for the UX.
     * but this implies a transaction. And we will not pay for everybody...
     * We can batch the incoming requests, and then notify users?
     */
    function claimTokens(uint256 fromAddress, uint256[] calldata bridgeRequest)
        public
        payable {
        // Deserialize the request.

        // Verify the address mapping from the request.

        // Deploy if required + register mapping if newly deployed.

        // Permissioned mint or transfer for each token.
    }

    /*
     * Test function for now. Need to be integrated correctly.
     */
    function _deployERC721Collection(
        uint256 l2Address,
        string memory name,
        string memory symbol)
        public payable
        returns (address) {

        ERC721Bridgeable c = new ERC721Bridgeable(name, symbol);
        _l1_to_l2_addresses[address(c)] = l2Address;

        emit CollectionDeployedFromL2(address(c), l2Address, name, symbol);

        return address(c);
    }

    /*
     * Deposit token in escrow and initiates the
     * transfer to Starknet.
     *
     * Will revert if any of the token is missing approval
     * for the bridge as operator.
     */
    function depositTokens(
        uint256 reqHash,
        address collectionAddress,
        uint256 ownerL2Address,
        uint256[] calldata tokensIds)
        external
        payable {

        require(CairoAdapter.isContractAddress(ownerL2Address), "Invalid L2 owner address");

        ERC721 collection = ERC721(collectionAddress);

        BridgeRequest memory req;

        req.header = 0xcafebeef;
        req.reqHash = reqHash;
        req.collectionL1Address = collectionAddress;
        req.collectionL2Address = _l1_to_l2_addresses[collectionAddress];
        req.collectionName = collection.name();
        req.collectionSymbol = collection.symbol();
        req.collectionContractType = 0x721;
        req.ownerL1Address = msg.sender;
        req.ownerL2Address = ownerL2Address;
        req.tokens = new TokenInfo[](tokensIds.length);

        address from = req.ownerL1Address;
        address to = address(this);

        for (uint256 i = 0; i < tokensIds.length; i++) {
            TokenInfo memory info;
            info.tokenId = tokensIds[i];

            // TODO: what to do if a token has no URI...?!! How to check that?
            //       verify that starknet handles the case of string of length 0.
            info.tokenURI = collection.tokenURI(info.tokenId);
            if (bytes(info.tokenURI).length == 0) {
                info.tokenURI = "NO_URI";
            }

            collection.transferFrom(from, to, info.tokenId);
            _escrow[collectionAddress][info.tokenId] = from;

            req.tokens[i] = info;
        }

        uint256[] memory payload = Protocol.bridgeRequestSerialize(req);

        // "on_l1_message" selector.
        uint256 selector
            = 0x035b18ea40fc0fe052a663bca34b1c66f25e888f6d54d0c518b9c68f451c65ea;

        IStarknetMessaging(_starknetCore).sendMessageToL2{value: msg.value}
        (_bridgeL2, selector, payload);
    }

    /*
     * Verifies if the request collection addresses are correct
     * and defines if a new deploy is required.
     */
    function _verifyRequestMappingAddresses(BridgeRequest memory req)
        internal
        view
        returns (address) {
        address l1AddrReq = req.collectionL1Address;
        uint256 l2AddrReq = req.collectionL2Address;
        address l1AddrMapping = _l2_to_l1_addresses[l2AddrReq];
        uint256 l2AddrMapping = _l1_to_l2_addresses[l1AddrReq];

        // L2 address must always be set as we receive the request from L2.
        if (!CairoAdapter.isContractAddress(l2AddrReq))
        {
            revert("Invalid collection L2 address from request");
        }

        // L2 address is present in the request and L1 address is not.
        if (CairoAdapter.isContractAddress(l2AddrReq) && l1AddrReq == address(0)) {
            if (l1AddrMapping == address(0)) {
                // It's the first token of the collection to be bridged.
                return address(0);
            } else {
                // It's not the first token of the collection to be bridged,
                // and the collection tokens were always bridged L2 -> L1.
                return l1AddrMapping;
            }
        }

        // L2 address is present, and L1 address too.
        if (CairoAdapter.isContractAddress(l2AddrReq) && l1AddrReq > address(0)) {
            if (l1AddrMapping != l1AddrReq) {
                revert("Invalid collection L1 address");
            } else if (l2AddrMapping != l2AddrReq) {
                revert("Invalid collection L2 address");
            } else {
                // All addresses match, we don't need to deploy anything.
                return l1AddrMapping;
            }
        }

        revert("UNREACHABLE");
    }
}