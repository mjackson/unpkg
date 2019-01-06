export default function addLeadingSlash(name) {
  return name.charAt(0) === '/' ? name : '/' + name;
}
