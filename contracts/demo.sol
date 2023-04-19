// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;

contract Demo {
    event SetAge(address user, uint age);
    mapping(address => uint) private _ages;

    function setAge(uint age) public {
        _ages[msg.sender] = age;
        emit SetAge(msg.sender, age);
    }

    function getAge(address user) public view returns (uint) {
        return _ages[user];
    }
}
