// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Hello {
    string private _name;
    event SetName(address, string);

    constructor(string memory name) {
        _name = name;
    }

    function get() public view returns (string memory) {
        return _name;
    }

    function set(string memory n) public {
        _name = n;
        emit SetName(msg.sender, n);
    }
}
