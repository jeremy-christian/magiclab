import React from "react";
import { Card, Avatar } from "antd";
import "antd/dist/antd.css";
import styled from "styled-components";

import { Tweet } from "../model";
const { Meta } = Card;

const SmallPrint = styled.div`
  font-size: 0.6rem;
  color: #afafaf;
  text-align: right;
  margin: auto 0 auto 0.3rem;
`;

const CardTitle = styled.div`
  display: flex;
`;

const TweetCard = ({ username, id, text, timeStamp, image }: Tweet) => {
  // convert timeStamp into dateString & remove prepended id from text string
  const dateString = new Date(timeStamp).toUTCString();
  const trimmedText = text.replace(`${id}. `, "");

  // define cardTitle component, arrange title contents using styled components
  // TODO move out of here
  const cardTitle = (
    <CardTitle>
      {username}
      <SmallPrint>{`  #${id}`}</SmallPrint>
      <SmallPrint style={{ width: "100%" }}>{dateString}</SmallPrint>
    </CardTitle>
  );

  return (
    <Card>
      <Meta
        avatar={<Avatar src={image} />}
        title={cardTitle}
        description={trimmedText}
      />
    </Card>
  );
};

export default TweetCard;
