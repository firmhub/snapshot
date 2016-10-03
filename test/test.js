const { suite, test } = require('mocha')
const fs = require('fs')
const path = require('path')
const should = require('should')

const dogfood = require('../index')
const { compare } = require('../dist/comparors')

function aComparison (t, a, b) {
  const expected = fs.readFileSync(path.join(__dirname, 'fixtures', a))
  const actual = fs.readFileSync(path.join(__dirname, 'fixtures', b))
  return compare(t, expected, actual)
}

function shouldHaveTextDiff (comparison) {
  should(comparison)
    .be.an.Object()
    .and.not.be.Null()
    .and.have.a.property('diff')

  comparison.diff
    .should.be.a.String()
    .and.match(/^@@/)

  return comparison.diff
}

function shouldHaveImageDiff (comparison) {
  comparison
    .should.be.an.Object()
    .and.not.be.Null()
    .and.have.a.property('diff')
      .be.a.String()
      .and.startWith('data:image/png')

  return comparison.diff
}

function shouldNotDiffer (comparison) {
  should(comparison).be.Null()
}

suite('(e2e) mocha-snapshot', function () {
  test('creates diff of single line text', dogfood('single-line-diff.txt', function () {
    return aComparison('txt', 'lorem-a.txt', 'lorem-b.txt').then(shouldHaveTextDiff)
  }))

  test('creates diff of multi line text', dogfood('multi-line-diff.txt', function () {
    return aComparison('txt', 'lorem-multi-a.txt', 'lorem-multi-b.txt').then(shouldHaveTextDiff)
  }))

  test('resolves with null when there is no difference', function () {
    return Promise.all([
      aComparison('txt', 'lorem-a.txt', 'lorem-a.txt').then(shouldNotDiffer),
      aComparison('txt', 'lorem-multi-a.txt', 'lorem-multi-a.txt').then(shouldNotDiffer)
    ])
  })

  test('creates diff of images', dogfood('image-major-change.png', function () {
    this.slow(5000)
    return aComparison('png', 'People.jpg', 'People2.jpg').then(shouldHaveImageDiff)
  }))
})
