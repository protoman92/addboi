data "aws_iam_role" "chatbot_iam_role" {
  name     = "${local.service}-${var.stage}-ap-southeast-1-lambdaRole"
  provider = aws.ap-southeast-1
}

data "aws_iam_policy" "AmazonDynamoDBFullAccess" {
  arn      = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
  provider = aws.ap-southeast-1
}

//resource "aws_iam_role_policy_attachment" "chatbot_dynamodb" {
//  policy_arn = data.aws_iam_policy.AmazonDynamoDBFullAccess.arn
//  role       = data.aws_iam_role.chatbot_iam_role.name
//  provider = aws.ap-southeast-1
//}

resource "aws_iam_policy" "dynamodb_policy" {
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:BatchGetItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchWriteItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "${module.ddb_user_context_cache.dynamodb_table_arn}"
    }
  ]
}
EOF
  provider = aws.ap-southeast-1
}

resource "aws_iam_role_policy_attachment" "chatbot_dynamodb" {
  policy_arn = aws_iam_policy.dynamodb_policy.arn
  role       = data.aws_iam_role.chatbot_iam_role.name
  provider = aws.ap-southeast-1
}
