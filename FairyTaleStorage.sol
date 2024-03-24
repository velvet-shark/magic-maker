// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract FairyTaleStorage {
    struct FairyTale {
        address author;
        string content;
        uint256 timestamp;
    }

    FairyTale[] public fairyTales;

    function submitFairyTale(string memory _content) public payable {
        require(
            msg.value > 0,
            "A small payment is required to store the fairy tale."
        );
        require(
            bytes(_content).length <= 10000,
            "Fairy tale content exceeds the maximum allowed length."
        );

        FairyTale memory newFairyTale = FairyTale({
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });

        fairyTales.push(newFairyTale);
    }

    function getFairyTaleCount() public view returns (uint256) {
        return fairyTales.length;
    }

    function getFairyTale(
        uint256 _index
    ) public view returns (address, string memory, uint256) {
        require(_index < fairyTales.length, "Invalid fairy tale index.");

        FairyTale memory fairyTale = fairyTales[_index];
        return (fairyTale.author, fairyTale.content, fairyTale.timestamp);
    }
}

// Deployed on Base:
// TODO: Contract verification
