// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

import "./interface/IEventOut.sol";

contract EventOut is IEventOut {
    function eventOut(uint32 _type, bytes memory _value) external override {
        emit OutEvent(msg.sender, _type, _value);
    }
}
