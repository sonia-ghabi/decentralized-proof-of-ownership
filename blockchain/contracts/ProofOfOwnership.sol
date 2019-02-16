pragma solidity ^0.5.0;

contract ProofOfOwnership {

    // Definition of a proof of ownership.
    struct proof { 
        string hashing;
        address owner; 
        uint date;  
        bool isValue;
        string ipfsHash;
    }

    // The map that stores all the proof of ownership.
    mapping (string => proof) proofMap;

    /**
        Save a new proof of ownership.
    */
    function saveProof(string memory hashing, address owner, string memory ipfsHash) public  {
        if (proofMap[hashing].isValue)
        {
            revert("The P.O.O. already exist");
        }
        proofMap[hashing] = proof(hashing, owner, now, true, ipfsHash);
    } 

    /**
        Get a proof of ownership from its hashing.
     */
    function getProof(string memory hashing) public view returns (address, uint) {
        if (!proofMap[hashing].isValue)
        {
            revert("The P.O.O. doesn't exist");
        } 
        proof memory p = proofMap[hashing];
        return (p.owner, p.date);
    } 
}