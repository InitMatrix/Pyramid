// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// import "hardhat/console.sol";

contract PyramidV1 is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdTracker;
    struct Node {
        address from;
        uint256 tokenId;
        uint level;
    }
    /// @notice 最大等级
    uint public _maxLevel;
    /// @notice 分佣权重
    uint256[] public _ratios;
    /// @notice 允许白名单
    bool public _enableWhite;
    /// @dev 节点列表
    mapping(address => Node) private _nodes;
    /// @dev 白名单列表
    mapping(address => mapping(address => bool)) private _whiteList;

    constructor(
        string memory name,
        string memory symbol,
        uint256[] memory ratios,
        bool enableWhite
    ) ERC721(name, symbol) {
        _ratios = ratios;
        _maxLevel = ratios.length;
        _enableWhite = enableWhite;
        // console.log("constructor Partner:maxLevel=", _maxLevel);
    }

    // 事件:新增节点
    event CreateNode(address from, address to, uint256 tokenId, uint256 level);
    event AddWhite(address from, address to);

    /// 设置不同级别分成比例
    /// @param newRatios 新分成比例
    function setRatios(uint256[] memory newRatios) public onlyOwner {
        require(
            newRatios.length >= _ratios.length,
            "new ratios length must >= old ratios length"
        );
        _ratios = newRatios;
        _maxLevel = newRatios.length;
    }

    /// 允许设置白名单
    /// @param enable enable
    function setEnableWhite(bool enable) public onlyOwner {
        _enableWhite = enable;
    }

    /// 设置一级代理
    /// @param targets 目标地址数组
    function setRoot(address[] memory targets) public onlyOwner {
        for (uint i = 0; i < targets.length; i++) {
            address to = targets[i];
            if (
                to == address(0x0) ||
                to == _msgSender() ||
                to == address(this) ||
                _nodes[to].tokenId != 0
            ) {
                continue;
            }
            uint256 tokenId = _toMint(to);
            _createNode(address(this), to, tokenId, 1);
        }
    }

    /// 构建节点
    /// @param from_ 前节点
    /// @param to_ 目标节点
    /// @param tokenId_ nft
    /// @param level_ 等级
    function _createNode(
        address from_,
        address to_,
        uint256 tokenId_,
        uint256 level_
    ) private {
        _nodes[to_] = Node({from: from_, tokenId: tokenId_, level: level_});
        emit CreateNode(from_, to_, tokenId_, level_);
    }

    /// 铸造NFT
    /// @param to 目标地址
    function _toMint(address to) private returns (uint256) {
        _tokenIdTracker.increment();
        uint256 tid = _tokenIdTracker.current();
        _mint(to, tid);
        return tid;
    }

    /// 设置白名单地址
    /// @param to 目标地址
    function addWhite(address to) public {
        require(_enableWhite, "admin is not allowed to set the whitelist");
        require(_nodes[_msgSender()].tokenId != 0, "target node is exist");
        require(
            _nodes[_msgSender()].level <= _maxLevel,
            "front node level >= maxLevel"
        );
        _whiteList[_msgSender()][to] = true;
        emit AddWhite(_msgSender(), to);
    }

    /// 确认绑定等级关系
    /// @param from 父节点地址
    function bind(address from) public {
        // console.log("confirm sender tokenid=", _nodes[_msgSender()].tokenId);
        require(from != address(0x0), "front node can not be zero");
        require(from != _msgSender(), "can not confirm itself");
        require(_nodes[_msgSender()].tokenId == 0, "The node already exists");
        require(_nodes[from].tokenId != 0, "front node not exist");
        require(_nodes[from].level < _maxLevel, "level overflow");
        require(
            !_enableWhite || _whiteList[from][_msgSender()],
            "not in white list"
        );
        uint256 tokenId = _toMint(_msgSender());
        uint256 level = _nodes[from].level + 1;
        _createNode(from, _msgSender(), tokenId, level);
    }

    /// 获取目标地址对应的上级地址和权重
    /// @param account 目标地址
    /// @return
    /// @return
    function getRebate(
        address account
    ) public view returns (address[] memory, uint256[] memory) {
        if (!isNode(account) || isRoot(account)) {
            address[] memory x = new address[](1);
            uint256[] memory y = new uint256[](1);
            x[0] = account;
            y[0] = 1;
            return (x, y);
        } else {
            uint256 n = _nodes[account].level;
            // console.log("n=", n);
            address[] memory x = new address[](n);
            uint256[] memory y = new uint256[](n);
            address curos = account;
            for (uint i = 0; i < n; i++) {
                Node memory node = _nodes[curos];
                uint256 m = node.level;
                // console.log("m=", m);

                x[i] = curos;
                y[i] = _ratios[m - 1];
                // y[n - i - 1] = _ratios[m - 1];
                curos = node.from;
            }
            return (x, y);
        }
    }

    /// 判断是否为根节点
    function isRoot() public view returns (bool) {
        return _nodes[_msgSender()].from == address(this);
    }

    /// 判断是否为根地址
    /// @param account 目标地址
    function isRoot(address account) public view returns (bool) {
        return _nodes[account].from == address(this);
    }

    /// 判断是否为节点
    function isNode() public view returns (bool) {
        return _nodes[_msgSender()].tokenId != 0;
    }

    /// 判断是否为节点
    /// @param account 目标地址
    function isNode(address account) public view returns (bool) {
        return _nodes[account].tokenId != 0;
    }

    /// 获取节点信息
    function getNode() public view returns (Node memory) {
        return _nodes[_msgSender()];
    }

    /// 获取节点信息
    /// @param user 目标地址
    function getNode(address user) public view returns (Node memory) {
        // console.log("hahahah");
        return _nodes[user];
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        revert("forbid");
    }
}
