// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./sn/Cairo.sol";

/**
 */
interface IStarklane {
    /**
       @notice Deposits token in escrow and initiates the
       transfer to Starknet. Will revert if any of the token is missing approval
       for the bridge as operator.

       @param salt A salt used to generate the request hash.
       @param collectionL1 Address of the collection contract.
       @param ownerL2 New owner address on Starknet.
       @param ids Ids of the token to transfer. At least 1 token is required.
       @param useWithdrawQuick If the quick withdraw method is selected.
    */
    function depositTokens(
        uint256 salt,
        address collectionL1,
        snaddress ownerL2,
        uint256[] calldata ids,
        bool useWithdrawQuick
    )
        external
        payable;

    /**
       @notice Withdraw tokens received from L2.

       @param request Serialized request containing the tokens to be withdrawed. 
    */
    function withdrawTokens(
        uint256[] calldata request
    )
        external
        payable;

    /**
       @notice Adds the hash of a message that can be consumed with the QUICK
       method.

       @param msgHash Hash of the message to be considered as consumable.
    */
    function addMessageHashForQuick(
        uint256 msgHash
    )
        external
        payable;

    /**
     */
    function l2Info()
        external
        returns (snaddress, felt252);

    //
    function escrowStatuses(
        address collection,
        uint256[] calldata ids
    )
        external
        returns (bool[] memory);
}
