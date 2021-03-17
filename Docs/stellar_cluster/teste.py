import json

with open('plots_cluster_101.json') as json_file:
    data = json.load(json_file)

plot1 = data['plots']['plot1']
print(plot1)

with open('plot1_obj_101.json', 'w') as outfile:
    json.dump(plot1, outfile, indent=2)