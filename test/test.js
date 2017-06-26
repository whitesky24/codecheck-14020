"use strict";

let assert = require("chai").assert;
let crypto = require("crypto");
let fs = require("fs");

let codecheck = require("codecheck");
let app = codecheck.consoleApp(process.env.APP_COMMAND);

let result_file = "./tmp_file_" + (+new Date());
let input_files = [
  "./input/input1.txt",
  "./input/input2.txt",
  "./input/input3.txt",
  "./input/input4.txt",
  "./input/input5.txt",
  "./input/input6.txt",
  "./input/input7.txt",
  "./input/input8.txt",
  "./input/input9.html",
  "./input/input10.html",
  "./input/input11.jpg",
  "./input/input12.svg",
  "./input/input13.svg",
  "./input/input14.svg",
  "./input/input15.svg"
];

function hash(filename, tag) {
  return new Promise((resolve, reject) => {
    let md5sum = crypto.createHash("md5");
    let f = fs.ReadStream(filename);
    f.on("data", (d) => {
      md5sum.update(d);
    });
    f.on("end", () => {
      let hex = md5sum.digest("hex");
      resolve({hex: hex, tag: tag})
    });
  });
}

describe("Base64 encode test", () => {
  for (let i = 0; i < input_files.length; i++) {
    let input_file = input_files[i];
    let output_file = "./output/output" + (i + 1) + ".txt";
    let args = ["-i", input_files[i], "-o", result_file];
    let title = "arguments: " + args.join(" ");
    it(title, () => {
      return app.run(args).spread(function(code, stdOut) {
        assert.equal(code, 0);
      }).then(() => {
        return Promise.all([hash(result_file, "actual"), hash(output_file, "expected")])
        .then((results) => {
          let expected = results.filter((v) => v.tag === "actual" ).pop().hex;
          let actual = results.filter((v) => v.tag === "expected" ).pop().hex;
          if (expected !== actual) {
            assert(false, "\nMD5 hash of expected result is " + expected + "\nMD5 hash of actual output is " + actual);
          }
          fs.unlink(result_file, (err) => { if (err) throw err; });
        });
      });
    });
  }
});

describe("Base64 decode test", () => {
  for (let i = 0; i < input_files.length; i++) {
    let input_file = "./output/output" + (i + 1) + ".txt";
    let output_file = input_files[i];
    let args = ["-d", "-i", input_file, "-o", result_file];
    let title = "arguments: " + args.join(" ");
    it(title, () => {
      return app.run(args).spread(function(code, stdOut) {
        assert.equal(code, 0);
      }).then(() => {
        return Promise.all([hash(result_file, "actual"), hash(output_file, "expected")])
        .then((results) => {
          let expected = results.filter((v) => v.tag === "actual" ).pop().hex;
          let actual = results.filter((v) => v.tag === "expected" ).pop().hex;
          if (expected !== actual) {
            assert(false, "\nMD5 hash of expected result is " + expected + "\nMD5 hash of actual output is " + actual);
          }
          fs.unlink(result_file, (err) => { if (err) throw err; });
        });
      });
    });
  }
});
