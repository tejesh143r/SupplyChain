const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SecureChainFlow Smart Contract", function () {
  let contract;
  let owner, manufacturer, custodian1, custodian2, aiMonitor;

  beforeEach(async function () {
    [owner, manufacturer, custodian1, custodian2, aiMonitor] = await ethers.getSigners();

    const SecureChainFlow = await ethers.getContractFactory("SecureChainFlow");
    contract = await SecureChainFlow.deploy();
    await contract.waitForDeployment();
  });

  it("Should register a product with dynamic category and metadata", async function () {
    const tx = await contract.connect(manufacturer).registerProduct(
      "BioPharma Cold Vaccine",
      "Pharmaceuticals",
      "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
    );
    await tx.wait();

    const product = await contract.getProduct(1);
    expect(product.productId).to.equal(1);
    expect(product.productName).to.equal("BioPharma Cold Vaccine");
    expect(product.category).to.equal("Pharmaceuticals");
    expect(product.manufacturer).to.equal(manufacturer.address);
    expect(product.currentCustodian).to.equal(manufacturer.address);
    expect(product.currentState).to.equal(0); // State.Created
    expect(product.isFlagged).to.be.false;
  });

  it("Should transfer custody across stakeholders", async function () {
    await contract.connect(manufacturer).registerProduct(
      "UltraSens Thermal Chip",
      "Electronics",
      "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG"
    );

    // Transfer from Manufacturer to Custodian1 (InTransit)
    await contract.connect(manufacturer).transferCustody(
      1,
      custodian1.address,
      2, // State.InTransit
      "Handed over to cold-chain logistics"
    );

    let product = await contract.getProduct(1);
    expect(product.currentCustodian).to.equal(custodian1.address);
    expect(product.currentState).to.equal(2);

    // Transfer from Custodian1 to Custodian2 (Inspected)
    await contract.connect(custodian1).transferCustody(
      1,
      custodian2.address,
      3, // State.Inspected
      "Passed quality check"
    );

    product = await contract.getProduct(1);
    expect(product.currentCustodian).to.equal(custodian2.address);
    expect(product.currentState).to.equal(3);

    const history = await contract.getProductHistory(1);
    expect(history.length).to.equal(3); // Created, InTransit, Inspected
  });

  it("Should allow AI module or authorized monitor to flag anomalous product", async function () {
    await contract.connect(manufacturer).registerProduct(
      "Organic Honey Batch #4",
      "Food & Agriculture",
      "QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx"
    );

    // AI Flags anomaly
    await contract.connect(aiMonitor).flagAnomalousProduct(
      1,
      "Temperature spike detected: 14.5C (Max threshold: 4C)"
    );

    const product = await contract.getProduct(1);
    expect(product.currentState).to.equal(5); // State.Flagged
    expect(product.isFlagged).to.be.true;
    expect(product.flagReason).to.contain("Temperature spike");

    // Attempting custody transfer on flagged product should revert
    await expect(
      contract.connect(manufacturer).transferCustody(1, custodian1.address, 2, "Try transfer")
    ).to.be.revertedWith("SecureChainFlow: Cannot transfer flagged product");
  });
});
