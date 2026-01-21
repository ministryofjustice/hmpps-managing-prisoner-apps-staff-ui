import { formatName } from './formatName'

enum NameFormatStyle {
  firstMiddleLast,
  lastCommaFirstMiddle,
  lastCommaFirst,
  firstLast,
}

describe('formatName', () => {
  describe('default style (firstMiddleLast)', () => {
    it('should format a name with first, middle, and last names', () => {
      expect(formatName('JOHN', 'MICHAEL', 'SMITH')).toBe('John Michael Smith')
    })

    it('should format a name with only first and last names', () => {
      expect(formatName('JOHN', '', 'SMITH')).toBe('John Smith')
    })

    it('should format a name with only first name', () => {
      expect(formatName('JOHN', '', '')).toBe('John')
    })

    it('should handle lowercase names', () => {
      expect(formatName('john', 'michael', 'smith')).toBe('John Michael Smith')
    })

    it('should handle mixed case names', () => {
      expect(formatName('JoHn', 'MiChAeL', 'SmItH')).toBe('John Michael Smith')
    })

    it('should capitalize hyphenated names correctly', () => {
      expect(formatName('MARY-JANE', '', 'SMITH-JONES')).toBe('Mary-Jane Smith-Jones')
    })

    it('should capitalize apostrophe names correctly', () => {
      expect(formatName('JOHN', '', "O'BRIEN")).toBe("John O'Brien")
    })

    it('should handle multiple spaces', () => {
      expect(formatName('JOHN', 'MICHAEL THOMAS', 'SMITH')).toBe('John Michael Thomas Smith')
    })

    it('should filter out empty strings', () => {
      expect(formatName('', '', 'SMITH')).toBe('Smith')
    })

    it('should handle all empty strings', () => {
      expect(formatName('', '', '')).toBe('')
    })
  })

  describe('lastCommaFirstMiddle style', () => {
    it('should format name as Last, First Middle', () => {
      expect(formatName('JOHN', 'MICHAEL', 'SMITH', { style: NameFormatStyle.lastCommaFirstMiddle })).toBe(
        'Smith, John Michael',
      )
    })

    it('should format name as Last, First when no middle name', () => {
      expect(formatName('JOHN', '', 'SMITH', { style: NameFormatStyle.lastCommaFirstMiddle })).toBe('Smith, John')
    })

    it('should handle hyphenated last names', () => {
      expect(formatName('JOHN', '', 'SMITH-JONES', { style: NameFormatStyle.lastCommaFirstMiddle })).toBe(
        'Smith-Jones, John',
      )
    })

    it('should handle apostrophes in last names', () => {
      expect(formatName('JOHN', '', "O'BRIEN", { style: NameFormatStyle.lastCommaFirstMiddle })).toBe("O'Brien, John")
    })

    it('should handle only last name provided', () => {
      expect(formatName('', '', 'SMITH', { style: NameFormatStyle.lastCommaFirstMiddle })).toBe('Smith,')
    })
  })

  describe('lastCommaFirst style', () => {
    it('should format name as Last, First (excluding middle name)', () => {
      expect(formatName('JOHN', 'MICHAEL', 'SMITH', { style: NameFormatStyle.lastCommaFirst })).toBe('Smith, John')
    })

    it('should format name as Last, First when no middle name', () => {
      expect(formatName('JOHN', '', 'SMITH', { style: NameFormatStyle.lastCommaFirst })).toBe('Smith, John')
    })

    it('should handle hyphenated names', () => {
      expect(formatName('MARY-JANE', 'ELIZABETH', 'SMITH-JONES', { style: NameFormatStyle.lastCommaFirst })).toBe(
        'Smith-Jones, Mary-Jane',
      )
    })

    it('should handle only last name provided', () => {
      expect(formatName('', '', 'SMITH', { style: NameFormatStyle.lastCommaFirst })).toBe('Smith,')
    })
  })

  describe('firstLast style', () => {
    it('should format name as First Last (excluding middle name)', () => {
      expect(formatName('JOHN', 'MICHAEL', 'SMITH', { style: NameFormatStyle.firstLast })).toBe('John Smith')
    })

    it('should format name as First Last when no middle name', () => {
      expect(formatName('JOHN', '', 'SMITH', { style: NameFormatStyle.firstLast })).toBe('John Smith')
    })

    it('should handle only first name', () => {
      expect(formatName('JOHN', '', '', { style: NameFormatStyle.firstLast })).toBe('John')
    })

    it('should handle only last name', () => {
      expect(formatName('', '', 'SMITH', { style: NameFormatStyle.firstLast })).toBe('Smith')
    })

    it('should handle hyphenated names', () => {
      expect(formatName('MARY-JANE', 'ELIZABETH', 'SMITH-JONES', { style: NameFormatStyle.firstLast })).toBe(
        'Mary-Jane Smith-Jones',
      )
    })
  })

  describe('edge cases', () => {
    it('should handle names with multiple hyphens', () => {
      expect(formatName('JEAN-MARIE-CLAUDE', '', 'SMITH')).toBe('Jean-Marie-Claude Smith')
    })

    it('should handle names with multiple apostrophes', () => {
      expect(formatName("D'ANGELO", '', "O'BRIEN")).toBe("D'Angelo O'Brien")
    })

    it('should handle names with spaces', () => {
      expect(formatName('MARY ANNE', '', 'SMITH')).toBe('Mary Anne Smith')
    })

    it('should preserve spaces in middle names', () => {
      expect(formatName('JOHN', '  MICHAEL  ', 'SMITH')).toBe('John   Michael   Smith')
    })

    it('should handle single letter names', () => {
      expect(formatName('J', 'M', 'SMITH')).toBe('J M Smith')
    })
  })
})
