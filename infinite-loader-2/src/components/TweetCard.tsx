import React from "react";
import { Card, Avatar, Skeleton } from "antd";
import "antd/dist/antd.css";
import styled from "styled-components";

import { Tweet } from "../model";
const { Meta } = Card;

const Container = styled.div`
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
`;

const StyledCard = styled(Card)`
  box-shadow: 0 8px 6px -6px rgba(0, 0, 0, 0.3);
  margin: 0 2rem 0 2rem;
  height: 100%;
`;

const SmallPrint = styled.div`
  font-size: 0.6rem;
  color: #afafaf;
  text-align: right;
  margin: auto 0 auto 0.3rem;
`;

const CardTitle = styled.div`
  display: flex;
`;

export const LoadingCard = ({ style }: { style: any }) => (
  <Container style={style}>
    <StyledCard>
      <Skeleton loading={true} avatar active></Skeleton>
    </StyledCard>
  </Container>
);

type TweetCardProps = Tweet & {
  style: Record<string, string>;
};

const TweetCard = ({
  username,
  id,
  text,
  timeStamp,
  image,
  style,
}: TweetCardProps) => {
  // convert timeStamp into dateString & remove prepended id from text string
  const dateString = new Date(timeStamp).toUTCString();
  const trimmedText = text.replace(`${id}. `, "");

  // define cardTitle component, arrange title contents using styled components
  const cardTitle = (
    <CardTitle>
      {username}
      <SmallPrint>{`  #${id}`}</SmallPrint>
      <SmallPrint style={{ width: "100%" }}>{dateString}</SmallPrint>
    </CardTitle>
  );

  return (
    <Container style={style}>
      <StyledCard>
        <Meta
          avatar={<Avatar src={image} />}
          title={cardTitle}
          description={trimmedText}
        />
      </StyledCard>
    </Container>
  );
};

export default TweetCard;
