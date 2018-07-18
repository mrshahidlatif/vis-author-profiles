import json
import re
import operator

data = json.load(open("../data/pdata.json", encoding="utf8"))

venues = {}
venueRawMapping = {}

print("Reading data ...")
for publication in data:
    venueRaw = publication["Venue"]
    # removing additional information (after comma, in brackets, etc.)
    venue = re.sub("(?<=.{10})(,|\(|\s-\s).*","", venueRaw)
    # removing year and index information
    venue = re.sub("\s?'\d\d|\d\d\d\d(:.*)?\s?|\d\d?(th|st|nd|rd)\s|\d\d\.?|(first|second|third|fourth|fith|sixth|seventh|eigth|nineth|tenth|eleventh|twelveth)", "", venue, flags=re.IGNORECASE)
    # removing roman numbers - https://stackoverflow.com/questions/267399/how-do-you-match-only-valid-roman-numerals-with-a-regular-expression
    venue = re.sub("\s((M{1,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|C?D|D?C{1,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|X?L|L?X{1,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|I?V|V?I{1,3})))(\s|\b|$)","",venue)
    # removing unneccessary phrases
    venue = re.sub("proceedings of( the)?","",venue,flags=re.IGNORECASE)
    # removing commas
    venue = re.sub(",","",venue)
    venue = venue.strip(" ")
    if not venue in venues:
        venues[venue] = 0
    venues[venue] += 1
    venueRawMapping[venueRaw] = venue;
print("... %d distinct venues identified\n" % len(venues))

print("Sorting by frequency ...")
preSortedVenues = sorted(venues.items(), key=operator.itemgetter(0))
sortedVenues = sorted(preSortedVenues, key=operator.itemgetter(1), reverse=True)
print("... the top venues are:")
for i in range(0,min(len(venues), 10)):
    print("\t" + str(sortedVenues[i]).strip("()"))
print("")

print("Writing data ...")
print("... venues.csv ...")
with open("venues.csv", "w", encoding="utf8") as out:
    for venue in sortedVenues:
        line = str(venue).strip("()")
        line = re.sub("'", "", line)
        out.write(line+"\n")
out.close()
print("... done")

print("... venue_raw_mapping.json")
with open('venue_raw_mapping.json', 'w') as outfile:
    json.dump(venueRawMapping, outfile)
print("... done")
