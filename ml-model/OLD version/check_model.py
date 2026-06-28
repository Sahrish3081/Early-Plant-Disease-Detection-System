import h5py, json
with h5py.File('plant_disease_model.h5', 'r') as f:
    config = f.attrs.get('model_config')
    if isinstance(config, bytes):
        config = config.decode('utf-8')
    data = json.loads(config)
    print('Model class:', data.get('class_name'))
    layers = data.get('config', {}).get('layers', [])
    print('Total layers:', len(layers))
    for l in layers[:5]:
        print(' -', l.get('class_name'), '| inbound_nodes:', l.get('inbound_nodes')) 
