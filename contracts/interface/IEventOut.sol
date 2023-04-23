// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

interface IEventOut {
    event OutEvent(address indexed sender, uint32 itype, bytes bvalue);

    function eventOut(uint32 _type, bytes memory _value) external;
}
