def tileDecide(i,j):
    if (i <= 1 or i >=23 ) or (j <= 1 or j >= 18):
        return 9
    if (i== 2):
        if (j == 2):
            return 17
        elif (j==3):
            return 25
    if (i==22):
        if (j == 2):
            return 19
        elif (j==3):
            return 27
    if (j == 2):
        return 18
    if (j == 3):
        return 26
    else:
        return 1

mapString = []
for j in range (0,20):
    newRow = []
    for i in range(0,25):
        newRow.append(tileDecide(i,j))
    mapString.append(newRow)

print "["
for j in range (0,20):
    string = "";
    for i in range(0,25):
        if (j==19 and i==24):
            string += str(mapString[j][i])
        else:
            string += str(mapString[j][i]) + ", "
    print string
print "],"
