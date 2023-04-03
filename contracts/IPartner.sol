// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IPartner {
    function getRebate(
        address account
    ) external view returns (address[] memory, uint256[] memory);

    function isRoot(address account) external view returns (bool);

    function isNode(address account) external view returns (bool);

    function bind(address from) external;
}
