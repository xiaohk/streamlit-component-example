## Quest Board Streamlit Component

# Development

Follow the instructions in the
[Streamlit Component Template](https://github.com/streamlit/component-template).

Run the example Streamlit app:

```
cd ./

# install template as editable package
pip install -e .

# run the example
streamlit run quest_board_streamlit/example.py
```

If you also want to make changes to the frontend, you need to first change
`_RELEASE` to `False` in `quest_board_streamlit/__init__.py`.

Then, initialize and run the frontend server in a separate terminal:

```
cd ./quest_board_streamlit/frontend

# Install npm dependencies
pnpm install

# Start the Webpack dev server
pnpm run start
```
