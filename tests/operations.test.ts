import { describe, it, expect, beforeEach } from 'vitest'
import HtmlDiff from '../src/lib/Diff'
import Operation from '../src/lib/Operation'
import Action from '../src/lib/Action'

function ops(before: string, after: string) {
	const res = new HtmlDiff(before, after)
	res.tokenizeInputs()
	return res.operations()
}
// Calculates the differences into a list of edit operations.
describe('calculateOperations', function () {
	describe('Actions', function () {
		describe('In the middle', function () {
			describe('Replace', function () {
				var before = 'working on it'
				var after = 'working in it'

				it('should result in 3 operations', function () {
					expect(ops(before, after).length).to.equal(3)
				})

				it('should replace "on"', function () {
					expect(ops(before, after)[1]).eql(<Operation>{
						action: Action.replace,
						startInOld: 2,
						endInOld: 3,
						startInNew: 2,
						endInNew: 3,
					})
				})
			})

			describe('insert', function () {
				var before = 'working it'
				var after = 'working in it'

				it('should result in 3 operations', function () {
					expect(ops(before, after).length).to.equal(3)
				})

				it('should show an insert for "on"', function () {
					expect(ops(before, after)[1]).eql(<Operation>{
						action: Action.insert,
						startInOld: 2,
						endInOld: 2,
						startInNew: 2,
						endInNew: 4,
					})
				})

				describe('More than one word', function () {
					var before = 'working it'
					var after = 'working all up on it'

					it('should still have 3 operations', function () {
						expect(ops(before, after).length).to.equal(3)
					})

					it('should show a big insert', function () {
						expect(ops(before, after)[1]).eql(<Operation>{
							action: Action.insert,
							startInOld: 2,
							endInOld: 2,
							startInNew: 2,
							endInNew: 8,
						})
					})
				})
			})

			describe('Delete', function () {
				var before = 'this is a lot of text'
				var after = 'this is text'

				it('should return 3 operations', function () {
					expect(ops(before, after).length).to.equal(3)
				})

				it('should show the delete in the middle', function () {
					expect(ops(before, after)[1]).eql(<Operation>{
						action: Action.delete,
						startInOld: 4,
						endInOld: 10,
						startInNew: 4,
						endInNew: 4,
					})
				})
			})

			describe('Equal', function () {
				var before = 'this is what it sounds like'
				var after = 'this is what it sounds like'

				it('should return a single op', function () {
					expect(ops(before, after).length).to.equal(1)
					expect(ops(before, after)[0]).eql(<Operation>{
						action: Action.equal,
						startInOld: 0,
						endInOld: 11,
						startInNew: 0,
						endInNew: 11,
					})
				})
			})
		})

		describe('At the beginning', function () {
			describe('Replace', function () {
				var before = 'I dont like veggies'
				var after = 'Joe loves veggies'

				it('should return 2 operations', function () {
					expect(ops(before, after).length).to.equal(4)
				})

				it('should have a replace at the beginning', function () {
					expect(ops(before, after)[0]).eql(<Operation>{
						action: Action.replace,
						startInOld: 0,
						endInOld: 1,
						startInNew: 0,
						endInNew: 1,
					})
				})
			})

			describe('insert', function () {
				var before = 'dog'
				var after = 'the shaggy dog'

				it('should return 2 operations', function () {
					expect(ops(before, after).length).to.equal(2)
				})

				it('should have an insert at the beginning', function () {
					expect(ops(before, after)[0]).eql(<Operation>{
						action: Action.insert,
						startInOld: 0,
						endInOld: 0,
						startInNew: 0,
						endInNew: 4,
					})
				})
			})

			describe('Delete', function () {
				var before = 'awesome dog barks'
				var after = 'dog barks'

				it('should return 2 operations', function () {
					expect(ops(before, after).length).to.equal(2)
				})

				it('should have a delete at the beginning', function () {
					expect(ops(before, after)[0]).eql(<Operation>{
						action: Action.delete,
						startInOld: 0,
						endInOld: 2,
						startInNew: 0,
						endInNew: 0,
					})
				})
			})
		})

		describe('At the end', function () {
			describe('Replace', function () {
				var before = 'the dog bit the cat'
				var after = 'the dog bit a bird'

				it('should return 2 operations', function () {
					expect(ops(before, after).length).to.equal(4)
				})

				it('should have a replace at the end', function () {
					expect(ops(before, after)[1]).eql(<Operation>{
						action: Action.replace,
						startInOld: 6,
						endInOld: 7,
						startInNew: 6,
						endInNew: 7,
					})
				})
			})

			describe('insert', function () {
				var before = 'this is a dog'
				var after = 'this is a dog that barks'

				it('should return 2 operations', function () {
					expect(ops(before, after).length).to.equal(2)
				})

				it('should have an Insert at the end', function () {
					expect(ops(before, after)[1]).eql(<Operation>{
						action: Action.insert,
						startInOld: 7,
						endInOld: 7,
						startInNew: 7,
						endInNew: 11,
					})
				})
			})

			describe('Delete', function () {
				var before = 'this is a dog that barks'
				var after = 'this is a dog'

				it('should have 2 operations', function () {
					expect(ops(before, after).length).to.equal(2)
				})

				it('should have a delete at the end', function () {
					expect(ops(before, after)[1]).eql(<Operation>{
						action: Action.delete,
						startInOld: 7,
						endInOld: 11,
						startInNew: 7,
						endInNew: 7,
					})
				})
			})
		})

		describe('Action Combination', function () {
			describe('dont absorb non-single-whitespace tokens', function () {
				var before = 'I  am awesome'
				var after = 'You  are great'

				it('should return 3 actions', function () {
					expect(ops(before, after).length).to.equal(5)
				})

				it('should have a replace first', function () {
					expect(ops(before, after)[0].action).to.equal(Action.replace)
				})
			})
		})
	})
})
