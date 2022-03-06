import { Center, Container, Space } from "@mantine/core";
import Lottie from "lottie-react";
import tumbleweedAnimation from "./tumbleweed.json";

export default function DefaultEmptyState() {
	return (
		<Center>
			<Container size="xs" padding="xs">
				<Lottie animationData={tumbleweedAnimation} />
				<Space h="sm" />
				<Center>Found Nothing Here</Center>
			</Container>
		</Center>
	);
}
