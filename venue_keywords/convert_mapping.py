import csv, json

venueKeywords = {}
venueRawKeywords = {}

with open("venues_keywords.csv", newline="") as csvfile:
    reader = csv.DictReader(csvfile, delimiter='\t', quotechar="'")
    for row in reader:
        venueKeywords[row["_venue"]] = []
        for keyword in row:
            if not keyword[0] == "_" and row[keyword] == "1":
                venueKeywords[row["_venue"]].append(keyword)

with open("venue_raw_mapping.json") as jsonData:
    venueRawMapping = json.load(jsonData)

for venueRaw in venueRawMapping:
    if venueRawMapping[venueRaw] in venueKeywords:
        keywords = venueKeywords[venueRawMapping[venueRaw]]
        if len(keywords) > 0:
            venueRawKeywords[venueRaw] = keywords
            print(venueRaw, venueKeywords[venueRawMapping[venueRaw]])

with open('../venue_keywords.json', 'w') as outfile:
    json.dump(venueRawKeywords, outfile)