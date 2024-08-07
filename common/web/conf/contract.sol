// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PongTournament {
    struct Tournament {
        uint256 id;
        string name;
        address winner;
        uint256 score;
    }

    Tournament[] public tournaments;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    event TournamentAdded(
        uint256 indexed id,
        string name,
        address indexed winner,
        uint256 score
    );

    function addTournament(
        uint256 _id,
        string memory _name,
        address _winner,
        uint256 _score
    ) public onlyOwner {
        tournaments.push(Tournament(_id, _name, _winner, _score));
        emit TournamentAdded(_id, _name, _winner, _score);
    }

    function getTournamentsCount() public view returns (uint256) {
        return tournaments.length;
    }

    function getTournamentByIndex(
        uint256 index
    ) public view returns (uint256, string memory, address, uint256) {
        require(index < tournaments.length, "Tournament index out of bounds");
        Tournament memory t = tournaments[index];
        return (t.id, t.name, t.winner, t.score);
    }

    function getLastTournament()
        public
        view
        returns (uint256, string memory, address, uint256)
    {
        require(tournaments.length > 0, "No tournaments recorded yet");
        Tournament memory lastTournament = tournaments[tournaments.length - 1];
        return (
            lastTournament.id,
            lastTournament.name,
            lastTournament.winner,
            lastTournament.score
        );
    }

    function getFirstTournament()
        public
        view
        returns (uint256, string memory, address, uint256)
    {
        require(tournaments.length > 0, "No tournaments recorded yet");
        Tournament memory firstTournament = tournaments[0];
        return (
            firstTournament.id,
            firstTournament.name,
            firstTournament.winner,
            firstTournament.score
        );
    }

    function getTournamentByName(
        string memory _name
    ) public view returns (uint256, string memory, address, uint256) {
        for (uint256 i = 0; i < tournaments.length; i++) {
            if (
                keccak256(bytes(tournaments[i].name)) == keccak256(bytes(_name))
            ) {
                return (
                    tournaments[i].id,
                    tournaments[i].name,
                    tournaments[i].winner,
                    tournaments[i].score
                );
            }
        }
        revert("Tournament not found");
    }

    function deleteTournament(uint256 _tournamentId) public onlyOwner {
        require(
            _tournamentId < tournaments.length,
            "Tournament id out of bounds"
        );
        tournaments[_tournamentId] = tournaments[tournaments.length - 1];
        tournaments.pop();
    }
}
