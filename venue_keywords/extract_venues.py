import json
import re
import operator
from pprint import pprint

data = json.load(open("../pubdata.json", encoding="utf8"))

venues = {}

print("Reading data ...")
for publication in data:
    venue_long = publication["Venue"]
    # removing additional information (after comma, in brackets, etc.)
    venue = re.sub("(?<=.{10})(,|\(|\s-\s).*","", venue_long)
    # removing year and index information
    venue = re.sub("\s?'\d\d|\d\d\d\d(:.*)?\s?|\d\d?(th|st|nd|rd)\s|\d\d\.?|(first|second|third|fourth|fith|sixth|seventh|eigth|nineth|tenth|eleventh|twelveth)", "", venue, flags=re.IGNORECASE)
    # removing roman numbers - https://stackoverflow.com/questions/267399/how-do-you-match-only-valid-roman-numerals-with-a-regular-expression
    venue = re.sub("\s((M{1,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|C?D|D?C{1,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|X?L|L?X{1,3})(IX|IV|V?I{0,3})|M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|I?V|V?I{1,3})))(\s|\b|$)","",venue)
    # removing unneccessary phrases
    venue = re.sub("proceedings of( the)?","",venue,flags=re.IGNORECASE)    
    venue = venue.strip(" ")
    if not venue in venues:
        venues[venue] = 0
    venues[venue] += 1
print("... %d distinct venues identified\n" % len(venues))

print("Sorting by frequency ...")
sorted_venues = sorted(venues.items(), key=operator.itemgetter(1), reverse=True)
print("... the top venues are:")
for i in range(0,min(len(venues), 10)):
    print("\t"+str(sorted_venues[i]).strip("()"))
print("")

print("Writing data ...")
with open("venues.csv", "w", encoding="utf8") as out:
    for venue in sorted_venues:
        out.write(str(venue).strip("()")+"\n")
out.close()
print("... done")
