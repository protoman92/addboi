data "aws_iam_role" "chatbot_production_iam_role" {
  name     = "${local.service}-production-${local.region}-lambdaRole"
  provider = aws.ap-southeast-1
}