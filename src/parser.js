export const parseXML = (rawData) => {
  const parser = new DOMParser();
  const node = parser.parseFromString(rawData, 'application/xml');
  return node;
};

const parseItem = (itemNode) => {
  const guid = itemNode.querySelector('guid').textContent;
  const title = itemNode.querySelector('title').textContent;
  const description = itemNode.querySelector('description').textContent;
  const url = itemNode.querySelector('link').textContent;

  const pubDateString = itemNode.querySelector('pubDate').textContent;
  const pubDate = new Date(pubDateString);

  return {
    guid, title, description, url, pubDate,
  };
};

export const parseFeed = (rssTree) => {
  try {
    const channelTree = rssTree.querySelector('channel');
    const title = channelTree.querySelector('title').textContent;
    const description = channelTree.querySelector('description').textContent;

    const itemNodes = Array.from(channelTree.querySelectorAll('item'));
    const items = itemNodes.map(parseItem);

    return {
      channel: {
        title,
        description,
      },
      items,
    };
  } catch (e) {
    const error = { errors: ['wrong_feed_format'] };
    throw error;
  }
};
