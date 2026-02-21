## MODIFIED Requirements

### Requirement: Word type breakdown display
The word type breakdown panel SHALL display occurrence counts (how many times each classified word appears in content) instead of unique type counts. The sum of all displayed type counts MAY be less than the total word count (due to unclassified words) but MUST NOT exceed it.

#### Scenario: Breakdown counts match occurrences
- **WHEN** content is "how to preserve substance/essence of style"
- **THEN** total word count SHALL reflect actual word count from Intl.Segmenter
- **AND** each word type count SHALL reflect occurrences of classified words
- **AND** sum of type counts SHALL be less than or equal to total word count

#### Scenario: Repeated classified words
- **WHEN** content contains "the big red the small blue the tall green"
- **THEN** articles count SHALL be 3 (three "the" occurrences)
- **AND** adjectives count SHALL be 6 (big, red, small, blue, tall, green)
