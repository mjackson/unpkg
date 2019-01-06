import SRIToolbox from 'sri-toolbox';

export default function getIntegrity(data) {
  return SRIToolbox.generate({ algorithms: ['sha384'] }, data);
}
